import { useState, useEffect, useCallback } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { z } from "zod";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().trim().max(1000, "Feedback must be under 1000 characters"),
});

interface Review {
  id: string;
  user_id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface ToolRatingProps {
  toolId: string;
}

const ToolRating = ({ toolId }: ToolRatingProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tool_reviews" as any)
        .select("*")
        .eq("tool_id", toolId)
        .order("created_at", { ascending: false });

      console.log("ToolRating fetch:", { data, error, toolId });

      const reviewData = ((data as unknown) as Review[]) || [];
      setReviews(reviewData);

      if (user) {
        const mine = reviewData.find((r) => r.user_id === user.id);
        if (mine) {
          setUserReview(mine);
          setUserRating(mine.rating);
          setFeedback(mine.feedback || "");
        }
      }
    } catch (e) {
      console.error("ToolRating error:", e);
    } finally {
      setLoading(false);
    }
  }, [toolId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (userRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const parsed = feedbackSchema.safeParse({ rating: userRating, feedback });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        await supabase
          .from("tool_reviews" as any)
          .update({
            rating: parsed.data.rating,
            feedback: parsed.data.feedback,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userReview.id);
        toast.success("Review updated!");
      } else {
        await supabase.from("tool_reviews" as any).insert({
          user_id: user.id,
          tool_id: toolId,
          rating: parsed.data.rating,
          feedback: parsed.data.feedback,
        });
        toast.success("Thanks for your review!");
      }
      await fetchReviews();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const StarButton = ({
    value,
    filled,
    onHover,
    onClick,
  }: {
    value: number;
    filled: boolean;
    onHover: (v: number) => void;
    onClick: (v: number) => void;
  }) => (
    <button
      type="button"
      onMouseEnter={() => onHover(value)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onClick(value)}
      className="p-0.5 transition-transform hover:scale-110"
    >
      <Star
        className={`h-6 w-6 transition-colors ${
          filled
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/40"
        }`}
      />
    </button>
  );

  if (loading) return null;

  const otherReviews = reviews.filter((r) => r.user_id !== user?.id);

  return (
    <section className="mt-16">
      <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
        Ratings & Feedback
        {reviews.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            — {avgRating.toFixed(1)} ★ ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
          </span>
        )}
      </h2>

      {/* Average rating display */}
      {reviews.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((v) => (
              <Star
                key={v}
                className={`h-5 w-5 ${
                  v <= Math.round(avgRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="font-heading text-2xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* User review form */}
      {user ? (
        <div className="mt-6 rounded border border-primary/10 bg-card p-5">
          <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
            {userReview ? "Update Your Review" : "Rate This Tool"}
          </h3>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <StarButton
                key={v}
                value={v}
                filled={v <= (hoverRating || userRating)}
                onHover={setHoverRating}
                onClick={setUserRating}
              />
            ))}
            {userRating > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {userRating}/5
              </span>
            )}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about this tool... (optional)"
            maxLength={1000}
            rows={3}
            className="mt-3 w-full rounded border border-primary/20 bg-background p-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {feedback.length}/1000
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || userRating === 0}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 neon-glow disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              {userReview ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded border border-primary/10 bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Sign in</Link> to rate this tool and leave feedback.
          </p>
        </div>
      )}

      {/* Other reviews */}
      {otherReviews.length > 0 && (
        <div className="mt-6 space-y-3">
          {otherReviews.slice(0, 10).map((review) => (
            <div
              key={review.id}
              className="rounded border border-primary/10 bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className={`h-3.5 w-3.5 ${
                        v <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.feedback && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ToolRating;
