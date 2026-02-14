import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius } from "../utils/theme";

const ReactionBar = ({ reactions = {}, userReaction, onReact }) => {
  const reactionTypes = [
    { type: "like", emoji: "👍", label: "Like" },
    { type: "love", emoji: "❤️", label: "Love" },
    { type: "wow", emoji: "😮", label: "Wow" },
  ];

  const handleReaction = (type) => {
    // If user clicked the same reaction, remove it (toggle)
    const newReaction = userReaction === type ? null : type;
    onReact(newReaction);
  };

  return (
    <View style={styles.container}>
      {reactionTypes.map(({ type, emoji, label }) => {
        const count = reactions[type] || 0;
        const isActive = userReaction === type;

        return (
          <TouchableOpacity
            key={type}
            style={[styles.reactionButton, isActive && styles.activeButton]}
            onPress={() => handleReaction(type)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            {count > 0 && (
              <Text style={[styles.count, isActive && styles.activeCount]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  activeButton: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  count: {
    ...typography.bodySmall,
    color: colors.darkGray,
    fontWeight: "600",
  },
  activeCount: {
    color: colors.primary,
  },
});

export default ReactionBar;
