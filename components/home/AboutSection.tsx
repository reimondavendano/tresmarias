import { Sparkles, Heart, Users, Award } from 'lucide-react';

export function AboutSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'We use only the finest products and latest techniques to ensure exceptional results.'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Every treatment is tailored to your unique needs and preferences.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our certified professionals have years of experience in beauty and wellness.'
    },
    {
      icon: Award,
      title: 'Recognized for Excellence',
      description: 'Recognized as one of the top salons in the city for excellence in service'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-salon-dark mb-6">
              Your Beauty Journey
              <span className="text-salon-primary block">Starts Here</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              For over 15 years, Tres Marias Salon has been the premier destination for luxury 
              beauty treatments. Our commitment to excellence, combined with our passion for 
              making every client feel special, has made us the most trusted salon in the city.
            </p>
            <p className="text-gray-600 mb-8">
              We believe that beauty is not just about looking good, but feeling confident 
              and radiant from within. Our expert team uses cutting-edge techniques and 
              premium products to deliver results that exceed expectations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-salon-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-salon-dark mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src="/assets/img/14.jpg"
                alt="Tres Marias salon interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-salon-primary text-white p-6 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-salon-primary">2K+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}