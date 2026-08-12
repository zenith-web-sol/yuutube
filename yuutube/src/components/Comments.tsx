import { Flag, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  parentid?: string | null;
  commentbody: string;
  usercommented: string;
  userimage?: string;
  commentedon: string;
  createdAt: string;
  editedAt?: string | null;
  isDeleted?: boolean;
  likes?: string[];
  dislikes?: string[];
}

const Comments = ({ videoId }: { videoId: string }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}?sort=${sort}`);
      setComments(res.data);
    } catch {
      setMessage("Unable to load comments.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    loadComments();
  }, [videoId, sort]);
  const roots = useMemo(
    () => comments.filter((comment) => !comment.parentid),
    [comments],
  );
  const replies = (id: string) =>
    comments.filter((comment) => String(comment.parentid) === id);
  const error = (err: any) =>
    err?.response?.data?.message || "Something went wrong. Please try again.";

  const submit = async (parentid: string | null = null) => {
    if (!user || !text.trim()) return;
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        parentid,
        commentbody: text,
        usercommented: user.name,
        userimage: user.image,
        language: navigator.language,
      });
      setComments((previous) => [res.data.commentData, ...previous]);
      setText("");
      setReplyTo(null);
      setMessage("");
    } catch (err) {
      setMessage(error(err));
    }
  };
  const react = async (id: string, reaction: "like" | "dislike") => {
    if (!user) return setMessage("Sign in to react.");
    try {
      const res = await axiosInstance.post(`/comment/${id}/reaction`, {
        userid: user._id,
        reaction,
      });
      setComments((all) =>
        all.map((item) => (item._id === id ? res.data.comment : item)),
      );
    } catch (err) {
      setMessage(error(err));
    }
  };
  const remove = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`, {
        data: { userid: user._id },
      });
      if (res.data.keptForReplies)
        setComments((all) =>
          all.map((item) =>
            item._id === id
              ? {
                  ...item,
                  isDeleted: true,
                  commentbody: "Comment deleted by author.",
                }
              : item,
          ),
        );
      else setComments((all) => all.filter((item) => item._id !== id));
    } catch (err) {
      setMessage(error(err));
    }
  };
  const saveEdit = async (id: string) => {
    if (!user || !text.trim()) return;
    try {
      const res = await axiosInstance.post(`/comment/editcomment/${id}`, {
        userid: user._id,
        commentbody: text,
      });
      setComments((all) =>
        all.map((item) => (item._id === id ? res.data.comment : item)),
      );
      setEditing(null);
      setText("");
    } catch (err) {
      setMessage(error(err));
    }
  };
  const report = async (id: string) => {
    if (!user) return setMessage("Sign in to report.");
    const reason = window.prompt(
      "Reason: Spam, Harassment, Offensive content, or Other",
      "Spam",
    );
    if (!reason) return;
    try {
      await axiosInstance.post(`/comment/${id}/report`, {
        userid: user._id,
        reason,
      });
      setMessage("Thanks. The comment has been flagged for review.");
    } catch (err) {
      setMessage(error(err));
    }
  };
  const startEdit = (comment: Comment) => {
    setEditing(comment._id);
    setReplyTo(null);
    setText(comment.commentbody);
  };
  const writeBox = (action: () => void, placeholder: string) => (
    <div className="mt-2 space-y-2">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className="min-h-20"
        maxLength={1000}
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setText("");
            setReplyTo(null);
            setEditing(null);
          }}
        >
          Cancel
        </Button>
        <Button onClick={action} disabled={!text.trim()}>
          Post
        </Button>
      </div>
    </div>
  );
  const item = (comment: Comment, nested = false) => (
    <div
      key={comment._id}
      className={nested ? "ml-5 border-l pl-4 sm:ml-10" : ""}
    >
      <div className="flex gap-3 py-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.userimage || ""} />
          <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{comment.usercommented}</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(
                new Date(comment.createdAt || comment.commentedon),
              )}{" "}
              ago
            </span>
            {comment.editedAt && (
              <span className="text-muted-foreground">(edited)</span>
            )}
          </div>
          {editing === comment._id ? (
            writeBox(() => saveEdit(comment._id), "Edit comment")
          ) : (
            <p
              className={`mt-1 break-words text-sm ${comment.isDeleted ? "italic text-muted-foreground" : ""}`}
            >
              {comment.commentbody}
            </p>
          )}
          {!comment.isDeleted && editing !== comment._id && (
            <div className="mt-1 flex flex-wrap gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => react(comment._id, "like")}
              >
                <ThumbsUp />
                {comment.likes?.length || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => react(comment._id, "dislike")}
              >
                <ThumbsDown />
                {comment.dislikes?.length || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyTo(comment._id);
                  setEditing(null);
                  setText("");
                }}
              >
                <MessageCircle />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => report(comment._id)}
              >
                <Flag />
                Report
              </Button>
              {String(comment.userid) === String(user?._id) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(comment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(comment._id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
          {replyTo === comment._id &&
            writeBox(
              () => submit(comment._id),
              `Reply to ${comment.usercommented}`,
            )}
        </div>
      </div>
      {replies(comment._id).map((reply) => item(reply, true))}
    </div>
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{roots.length} Comments</h2>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostliked">Most liked</option>
        </select>
      </div>
      {message && <p className="rounded-md bg-muted p-2 text-sm">{message}</p>}
      {user ? (
        writeBox(() => submit(), "Add a comment...")
      ) : (
        <p className="text-sm text-muted-foreground">
          Sign in to join the conversation.
        </p>
      )}
      {loading ? (
        <p className="text-sm">Loading comments...</p>
      ) : roots.length ? (
        <div>{roots.map((comment) => item(comment))}</div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      )}
    </section>
  );
};

export default Comments;
