import { TestimonialCard } from './testimonial-card';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Commercial Pilot',
    avatar: '✈️',
    rating: 5,
    date: 'December 2024',
    content: 'As a commercial pilot, clear communication is critical. This platform helped me master the NATO phonetic alphabet in just a few days. The audio pronunciations are spot-on and the practice modes are incredibly effective!'
  },
  {
    name: 'James Rodriguez',
    role: 'Air Traffic Controller',
    avatar: '📡',
    rating: 5,
    date: 'November 2024',
    content: 'I use this daily to train new controllers. The interactive tools and real-time feedback make learning so much easier than traditional methods. Highly recommend for anyone in aviation!'
  },
  {
    name: 'Emily Chen',
    role: 'Emergency Dispatcher',
    avatar: '🚨',
    rating: 5,
    date: 'November 2024',
    content: 'Perfect for emergency services training! The quiz modes helped me get up to speed quickly. Now I can spell out critical information clearly under pressure. Game changer for our dispatch center.'
  },
  {
    name: 'Isaac Yeboah',
    role: 'Military Reservist',
    avatar: '🪖',
    rating: 5,
    date: 'December 2024',
    content: 'Game changer for our reserve unit! I struggled with phonetic alphabet recall under pressure until I found this platform. After two weeks of daily practice, I aced our communications assessment. I recommended to my entire squad, and our radio discipline has improved dramatically. Essential tool for any service member.'
  },
  {
    name: 'Lisa Anderson',
    role: 'Maritime Radio Operator',
    avatar: '⚓',
    rating: 5,
    date: 'October 2024',
    content: 'Working on ships requires crystal clear radio communication. This platform made learning the phonetic alphabet fun and effective. The text converter tool is brilliant for practice scenarios!'
  },
  {
    name: 'David Park',
    role: 'Flight Instructor',
    avatar: '🛩️',
    rating: 5,
    date: 'September 2024',
    content: 'I recommend this to all my student pilots. The combination of visual aids, audio pronunciation, and interactive quizzes is exactly what aviation students need. Best phonetic alphabet trainer available!'
  }
];

export function TestimonialsGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={index} {...testimonial} />
      ))}
    </div>
  );
}

