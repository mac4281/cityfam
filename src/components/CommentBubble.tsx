import { Comment } from '@/types/comment';

interface CommentBubbleProps {
  comment: Comment;
  isCurrentUser: boolean;
}

export default function CommentBubble({ comment, isCurrentUser }: CommentBubbleProps) {
  return (
    <div
      className={`flex items-end gap-0 px-2 py-0.5 ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex flex-col gap-1 ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Comment content bubble */}
        <div
          className={`px-3 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{comment.content}</p>
        </div>

        {/* Author name */}
        <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
          {comment.authorName}
        </p>
      </div>
    </div>
  );
}

