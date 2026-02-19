import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1607321809142-5364a2fc94a8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxoYXBweSUyMGluZGlhbiUyMGZhcm1lciUyMGluJTIwZmllbGR8ZW58MHx8fHwxNzcxNTA2NzU0fDA&ixlib=rb-4.1.0&q=85)' }}
        >
          <div className="absolute inset-0 bg-forest/80"></div>
        </div>
        <div className="relative container-custom h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-syne" data-testid="about-title">About Us</h1>
            <p className="text-xl text-cream/90">Growing together with nature</p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 font-syne text-forest">Our Mission</h2>
            <p className="text-lg text-earth/80 leading-relaxed">
              At Samruddhi Organics, we are committed to empowering farmers with 100% organic and natural farming supplies. 
              Our mission is to promote sustainable agriculture and help build a healthier ecosystem for future generations. 
              We believe in the power of organic farming to transform lives and the environment.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: '100% Organic', desc: 'All products are certified organic and free from chemicals' },
              { icon: Heart, title: 'Farm to Table', desc: 'Direct sourcing from trusted organic suppliers' },
              { icon: Award, title: 'Quality Tested', desc: 'Every product undergoes rigorous quality checks' },
              { icon: Users, title: 'Community First', desc: 'Supporting farmers and sustainable practices' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-4 bg-lime/10 rounded-full mb-4">
                  <item.icon className="w-8 h-8 text-forest" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-syne text-forest">{item.title}</h3>
                <p className="text-earth/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 font-syne text-forest">Our Story</h2>
              <p className="text-earth/80 mb-4 leading-relaxed">
                Founded with a vision to make organic farming accessible to all, Samruddhi Organics started as a small initiative 
                to support local farmers. Today, we serve thousands of farmers across India with our range of organic seeds, 
                fertilizers, pesticides, and farming equipment.
              </p>
              <p className="text-earth/80 mb-4 leading-relaxed">
                Our name 'Samruddhi' means prosperity, and that's exactly what we aim to bring to the farming community - 
                prosperity through sustainable and organic practices.
              </p>
              <p className="text-earth/80 leading-relaxed">
                We work closely with organic certification bodies and maintain strict quality standards to ensure that every 
                product we deliver meets the highest organic benchmarks.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/5425794/pexels-photo-5425794.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
                alt="Organic Farming" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-forest text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-12 font-syne">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Sustainability', desc: 'We promote farming practices that protect our planet' },
              { title: 'Integrity', desc: 'Honest and transparent in all our dealings' },
              { title: 'Innovation', desc: 'Constantly improving to serve farmers better' }
            ].map((value, idx) => (
              <div key={idx} className="p-6">
                <h3 className="text-2xl font-bold mb-3 font-syne text-lime">{value.title}</h3>
                <p className="text-cream/90">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;