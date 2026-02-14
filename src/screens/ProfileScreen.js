import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import CustomButton from "../components/CustomButton";
import { colors, typography, spacing, borderRadius } from "../utils/theme";

const ProfileScreen = ({ navigation, route }) => {
  const { user: currentUser, logout } = useAuth();
  const userId = route?.params?.userId || currentUser?.id;
  const isOwnProfile = userId === currentUser?.id;

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState("recipes");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserRecipes();
    if (isOwnProfile) {
      fetchSavedRecipes();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getById(userId);
      setUser(response.data);
      setIsFollowing(response.data.is_following || false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const response = await userAPI.getRecipes(userId);
      setRecipes(response.data || []);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const response = await userAPI.getSavedRecipes(userId);
      setSavedRecipes(response.data || []);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await userAPI.unfollow(userId);
        setIsFollowing(false);
        setUser({ ...user, followers_count: (user.followers_count || 1) - 1 });
      } else {
        await userAPI.follow(userId);
        setIsFollowing(true);
        setUser({ ...user, followers_count: (user.followers_count || 0) + 1 });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayRecipes = activeTab === "recipes" ? recipes : savedRecipes;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>

          <Text style={styles.name}>{user?.name || "Unknown User"}</Text>

          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{recipes.length}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {user?.followers_count || 0}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {user?.following_count || 0}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {isOwnProfile ? (
            <View style={styles.actionButtons}>
              <CustomButton
                title="Edit Profile"
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              <CustomButton
                title="Logout"
                variant="ghost"
                size="small"
                onPress={handleLogout}
                style={styles.actionButton}
              />
            </View>
          ) : (
            <CustomButton
              title={isFollowing ? "Following" : "Follow"}
              variant={isFollowing ? "secondary" : "primary"}
              size="medium"
              onPress={handleFollowToggle}
              style={styles.followButton}
            />
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "recipes" && styles.activeTab]}
            onPress={() => setActiveTab("recipes")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "recipes" && styles.activeTabText,
              ]}
            >
              My Recipes
            </Text>
          </TouchableOpacity>

          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.tab, activeTab === "saved" && styles.activeTab]}
              onPress={() => setActiveTab("saved")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "saved" && styles.activeTabText,
                ]}
              >
                Saved
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recipe List */}
        <View style={styles.recipeList}>
          {displayRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>
                {activeTab === "recipes"
                  ? "No recipes yet"
                  : "No saved recipes"}
              </Text>
            </View>
          ) : (
            displayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id || recipe.id}
                recipe={recipe}
                onPress={() =>
                  navigation.navigate("Detail", {
                    recipeId: recipe._id || recipe.id,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 40,
    color: colors.white,
    fontWeight: "bold",
  },
  name: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.darkGray,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: spacing.lg,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    ...typography.h3,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.darkGray,
  },
  actionButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  followButton: {
    width: "100%",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.darkGray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  recipeList: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.darkGray,
  },
});

export default ProfileScreen;
