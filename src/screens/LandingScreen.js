import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recipeAPI } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import { colors, typography, spacing, borderRadius } from "../utils/theme";

const CATEGORIES = [
  "All",
  "Appetizer",
  "Main Course",
  "Dessert",
  "Snack",
  "Beverage",
];
const SORT_OPTIONS = ["latest", "trending"];

const LandingScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchRecipes(true);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchRecipes(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecipes = async (reset = false) => {
    if (loading || loadingMore) return;

    const currentPage = reset ? 1 : page;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        category: selectedCategory === "All" ? "" : selectedCategory,
        sort: sortBy,
      };

      const response = await recipeAPI.getAll(params);
      const newRecipes = response.data.recipes || response.data;

      if (reset) {
        setRecipes(newRecipes);
        setPage(2);
      } else {
        setRecipes([...recipes, ...newRecipes]);
        setPage(currentPage + 1);
      }

      // Check if there are more recipes
      setHasMore(newRecipes.length === 10);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes(true);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchRecipes(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* App Title */}
      <View style={styles.titleRow}>
        <Text style={styles.logo}>🍳</Text>
        <Text style={styles.title}>Masakin</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.darkGray}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.sortButton,
              sortBy === option && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy(option)}
          >
            <Text
              style={[
                styles.sortText,
                sortBy === option && styles.sortTextActive,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🍽️</Text>
        <Text style={styles.emptyText}>No recipes found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
      </View>
    );
  };

  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              navigation.navigate("Detail", { recipeId: item._id || item.id })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  logo: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.white,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sortLabel: {
    ...typography.bodySmall,
    color: colors.darkGray,
    marginRight: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
  },
  sortText: {
    ...typography.caption,
    color: colors.text,
  },
  sortTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  footer: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.darkGray,
    marginTop: spacing.md,
  },
});

export default LandingScreen;
