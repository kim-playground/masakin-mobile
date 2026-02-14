import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  colors,
  typography,
  borderRadius,
  spacing,
  shadows,
} from "../utils/theme";

const RecipeCard = ({ recipe, onPress }) => {
  const {
    image_url,
    title,
    author,
    cooking_time,
    difficulty,
    reactions_count = 0,
    comments_count = 0,
    saves_count = 0,
  } = recipe;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return colors.success;
      case "medium":
        return colors.primary;
      case "hard":
        return colors.error;
      default:
        return colors.darkGray;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Recipe Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image_url || "https://via.placeholder.com/400x250" }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />

        {/* Difficulty Badge */}
        {difficulty && (
          <View
            style={[
              styles.badge,
              { backgroundColor: getDifficultyColor(difficulty) },
            ]}
          >
            <Text style={styles.badgeText}>{difficulty}</Text>
          </View>
        )}
      </View>

      {/* Recipe Info */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>
              {author?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.authorName} numberOfLines={1}>
            {author?.name || "Unknown"}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {cooking_time && (
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statText}>{cooking_time} min</Text>
            </View>
          )}

          <View style={styles.stat}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statText}>{reactions_count}</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{comments_count}</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statIcon}>🔖</Text>
            <Text style={styles.statText}>{saves_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.medium,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  badge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "bold",
  },
  authorName: {
    ...typography.bodySmall,
    color: colors.darkGray,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  statIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.darkGray,
  },
});

export default RecipeCard;
