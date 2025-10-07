import { TestimonialCard } from './testimonial-card';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Commercial Pilot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
    rating: 5,
    date: 'October 2025',
    content: 'As a commercial pilot, clear communication is critical. This platform helped me master the NATO phonetic alphabet in just a few days. The audio pronunciations are spot-on!'
  },
  {
    name: 'James Rodriguez',
    role: 'Air Traffic Controller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=c0aede',
    rating: 5,
    date: 'September 2025',
    content: 'I use this daily to train new controllers. The interactive tools and real-time feedback make learning so much easier than traditional methods. Highly recommend!'
  },
  {
    name: 'Emily Chen',
    role: 'Emergency Dispatcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=ffd5dc',
    rating: 4,
    date: 'August 2025',
    content: 'Perfect for emergency services training! The quiz modes helped me get up to speed quickly. Now I can spell out critical information clearly under pressure.'
  },
  {
    name: 'Isaac Yeboah',
    role: 'Military Reservist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac&backgroundColor=d1d4f9',
    rating: 5,
    date: 'July 2025',
    content: 'Game changer for our reserve unit! After two weeks of daily practice, I aced our communications assessment. I recommended to my entire squad, and our radio discipline has improved dramatically.'
  },
  {
    name: 'Lisa Anderson',
    role: 'Maritime Radio Operator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=ffdfbf',
    rating: 5,
    date: 'June 2025',
    content: 'Working on ships requires crystal clear radio communication. This platform made learning the phonetic alphabet fun and effective. The text converter tool is brilliant!'
  },
  {
    name: 'David Park',
    role: 'Flight Instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=c7ecee',
    rating: 4,
    date: 'May 2025',
    content: 'I recommend this to all my student pilots. The combination of visual aids, audio pronunciation, and interactive quizzes is exactly what aviation students need.'
  },
  {
    name: 'Marcus Thompson',
    role: 'Police Officer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=dfe7fd',
    rating: 5,
    date: 'April 2025',
    content: 'Essential for law enforcement! We use phonetic alphabet daily for license plates and radio communications. This platform made training our new recruits so much easier.'
  },
  {
    name: 'Rachel Kim',
    role: 'Customer Service Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel&backgroundColor=ffeaa7',
    rating: 4,
    date: 'March 2025',
    content: 'Our call center handles international clients and spelling names correctly is crucial. This tool helped our entire team master the phonetic alphabet in a week.'
  },
  {
    name: 'Tom Bradley',
    role: 'Amateur Radio Operator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom&backgroundColor=fab1a0',
    rating: 5,
    date: 'February 2025',
    content: 'Been a ham radio operator for 20 years and I still use this to stay sharp. The audio pronunciation feature is incredibly accurate. Great for both beginners and experienced operators!'
  },
  {
    name: 'Nina Patel',
    role: 'Medical Helicopter Pilot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina&backgroundColor=e0c3fc',
    rating: 5,
    date: 'January 2025',
    content: 'In medical aviation, every second counts and communication must be flawless. This platform helped me achieve 100% accuracy in phonetic spelling.'
  },
  {
    name: 'Carlos Mendez',
    role: 'Telecommunications Technician',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=a29bfe',
    rating: 4,
    date: 'December 2024',
    content: 'Working with network configurations requires precise communication of codes and IDs. The text converter tool is a lifesaver for verifying complex strings.'
  },
  {
    name: 'Jennifer Walsh',
    role: 'Coast Guard Officer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer&backgroundColor=74b9ff',
    rating: 5,
    date: 'November 2024',
    content: 'Search and rescue operations demand crystal clear radio communication. This platform is now part of our standard training protocol. The quiz modes are excellent!'
  }
];

export function TestimonialsGrid() {
  return (
    <div className="relative mb-12 py-4">
      {/* Scrolling container */}
      <div className="overflow-hidden">
        <div className="flex gap-6 animate-scroll-horizontal items-stretch">
          {/* First set of testimonials */}
          {testimonials.map((testimonial, index) => (
            <div key={`first-${index}`} className="flex-shrink-0 w-[350px] h-[320px]">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {testimonials.map((testimonial, index) => (
            <div key={`second-${index}`} className="flex-shrink-0 w-[350px] h-[320px]">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-warmNeutral-50 dark:from-warmNeutral-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-warmNeutral-50 dark:from-warmNeutral-900 to-transparent pointer-events-none z-10"></div>

      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-horizontal {
          animation: scroll-horizontal 40s linear infinite;
        }

        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

