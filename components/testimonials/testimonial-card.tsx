interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

export function TestimonialCard({ name, role, avatar, rating, date, content }: TestimonialCardProps) {
  return (
    <div className="card p-4 md:p-5 hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-start gap-2 md:gap-2.5 min-w-0 flex-1">
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-coolBlue-100 dark:ring-coolBlue-900/20"
          />
          <div className="min-w-0 flex-1 -space-y-0.5">
            <h4 className="font-bold text-sm md:text-base leading-none truncate">{name}</h4>
            <p className="text-xs text-tertiary leading-none pt-1">{role}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Content - flex-grow to push date to bottom */}
      <p className="text-secondary leading-relaxed mb-3 flex-grow text-xs md:text-sm">{content}</p>

      {/* Date */}
      <p className="text-xs text-tertiary font-medium">{date}</p>
    </div>
  );
}

