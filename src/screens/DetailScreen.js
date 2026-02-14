import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recipeAPI, commentAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReactionBar from "../components/ReactionBar";
import CustomButton from "../components/CustomButton";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../utils/theme";

const DetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    fetchRecipeDetails();
    fetchComments();
  }, [recipeId]);

  const fetchRecipeDetails = async () => {
    try {
      const response = await recipeAPI.getById(recipeId);
      const recipeData = response.data;
      setRecipe(recipeData);
      setUserReaction(recipeData.user_reaction || null);
      setIsSaved(recipeData.is_saved || false);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      Alert.alert("Error", "Failed to load recipe details");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByRecipe(recipeId);
      setComments(response.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await recipeAPI.react(recipeId, reactionType);
      setUserReaction(reactionType);

      // Update local reaction count
      if (recipe) {
        const updatedRecipe = { ...recipe };
        if (userReaction) {
          updatedRecipe.reactions[userReaction] =
            (updatedRecipe.reactions[userReaction] || 1) - 1;
        }
        if (reactionType) {
          updatedRecipe.reactions[reactionType] =
            (updatedRecipe.reactions[reactionType] || 0) + 1;
        }
        setRecipe(updatedRecipe);
      }
    } catch (error) {
      console.error("Error reacting to recipe:", error);
      Alert.alert("Error", "Failed to add reaction");
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await recipeAPI.unsave(recipeId);
        setIsSaved(false);
      } else {
        await recipeAPI.save(recipeId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe?.title}`,
        title: recipe?.title,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await commentAPI.create(recipeId, newComment.trim());
      setComments([response.data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const toggleIngredient = (index) => {
    setCheckedIngredients({
      ...checkedIngredients,
      [index]: !checkedIngredients[index],
    });
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

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recipe Image */}
        <Image
          source={{
            uri: recipe.image_url || "https://via.placeholder.com/400x300",
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Recipe Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Author Info */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>
                {recipe.author?.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {recipe.author?.name || "Unknown"}
              </Text>
              <Text style={styles.authorSubtext}>
                {recipe.created_at
                  ? new Date(recipe.created_at).toLocaleDateString()
                  : ""}
              </Text>
            </View>
            {recipe.author?._id !== user?.id && (
              <CustomButton
                title="Follow"
                variant="outline"
                size="small"
                style={styles.followButton}
              />
            )}
          </View>

          {/* Metadata */}
          <View style={styles.metadataRow}>
            {recipe.cooking_time && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>⏱️</Text>
                <Text style={styles.metadataText}>
                  {recipe.cooking_time} min
                </Text>
              </View>
            )}
            {recipe.portions && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>🍽️</Text>
                <Text style={styles.metadataText}>
                  {recipe.portions} servings
                </Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>📊</Text>
                <Text style={styles.metadataText}>{recipe.difficulty}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBar}>
            <ReactionBar
              reactions={recipe.reactions || {}}
              userReaction={userReaction}
              onReact={handleReaction}
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>
                  {isSaved ? "🔖" : "📑"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description */}
        {recipe.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients?.map((ingredient, index) => (
            <TouchableOpacity
              key={index}
              style={styles.ingredientRow}
              onPress={() => toggleIngredient(index)}
            >
              <View style={styles.checkbox}>
                {checkedIngredients[index] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.ingredientText,
                  checkedIngredients[index] && styles.ingredientChecked,
                ]}
              >
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps?.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step.description || step}</Text>
            </View>
          ))}
        </View>

        {/* Cook Mode Button */}
        <CustomButton
          title="Start Cook Mode 👨‍🍳"
          variant="secondary"
          onPress={() => navigation.navigate("CookMode", { recipe })}
          style={styles.cookModeButton}
        />

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

          {/* Add Comment */}
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              placeholderTextColor={colors.darkGray}
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={commentLoading || !newComment.trim()}
              style={styles.sendButton}
            >
              <Text style={styles.sendButtonText}>
                {commentLoading ? "..." : "📤"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comment List */}
          {comments.map((comment, index) => (
            <View key={index} style={styles.commentRow}>
              <View style={styles.commentAvatar}>
                <Text style={styles.avatarText}>
                  {comment.user?.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>
                  {comment.user?.name || "User"}
                </Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleDateString()
                    : ""}
                </Text>
              </View>
            </View>
          ))}
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    ...typography.h3,
    color: colors.darkGray,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.body,
    fontWeight: "600",
  },
  authorSubtext: {
    ...typography.caption,
    color: colors.darkGray,
  },
  followButton: {
    paddingHorizontal: spacing.md,
  },
  metadataRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  metadataIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  metadataText: {
    ...typography.bodySmall,
    color: colors.darkGray,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  iconButtonText: {
    fontSize: 24,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.darkGray,
    lineHeight: 24,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  checkmark: {
    color: colors.primary,
    fontWeight: "bold",
  },
  ingredientText: {
    ...typography.body,
    flex: 1,
  },
  ingredientChecked: {
    textDecorationLine: "line-through",
    color: colors.darkGray,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "bold",
  },
  stepText: {
    ...typography.body,
    flex: 1,
    lineHeight: 24,
  },
  cookModeButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  addCommentRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    marginRight: spacing.sm,
  },
  sendButton: {
    padding: spacing.sm,
    justifyContent: "center",
  },
  sendButtonText: {
    fontSize: 24,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  commentText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  commentTime: {
    ...typography.caption,
    color: colors.darkGray,
  },
});

export default DetailScreen;
