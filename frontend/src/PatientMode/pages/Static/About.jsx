import React from 'react';
import Header from '../../components/Header'; // Adjust the import path based on your project structure
import Footer from '../../components/Footer'; // Adjust the import path based on your project structure

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-grow px-6 md:px-12 lg:px-20">
        {/* About Us Heading */}
        <div className="text-center text-2xl pt-10 text-[#707070]">
          <p>
            ABOUT <span className="text-gray-700 font-semibold">US</span>
          </p>
        </div>

        {/* About Us Content */}
        <div className="my-10 flex flex-col gap-6 text-sm text-gray-600">
          <p>
            Welcome to WeCureIT, your trusted platform for seamless healthcare connections. At WeCureIT, we believe that scheduling appointments and accessing quality healthcare should be simple, convenient, and stress-free.
          </p>
          <p>
            Our platform is designed to bridge the gap between patients and healthcare providers, offering a streamlined way to book appointments, find trusted specialists, and explore facilities that cater to your unique needs.
          </p>
          <p>
            With a focus on innovation and user satisfaction, WeCureIT leverages cutting-edge technology to ensure a superior experience for all users. Whether you're scheduling your first consultation or managing ongoing healthcare, WeCureIT is here to support you every step of the way.
          </p>
          <b className="text-gray-800">Our Vision</b>
          <p>
            At WeCureIT, our vision is to transform how healthcare is accessed and delivered. By empowering patients and healthcare providers with a comprehensive, user-friendly platform, we aim to create a world where quality healthcare is accessible to all.
          </p>
        </div>

        {/* Why Choose Us Heading */}
        <div className="text-xl my-4 text-center">
          <p>
            WHY <span className="text-gray-700 font-semibold">CHOOSE US</span>
          </p>
        </div>

        {/* Why Choose Us Content */}
        <div className="flex flex-col md:flex-row gap-6 mb-20">
          <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] bg-white hover:bg-indigo-500 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-md">
            <b>EFFICIENCY</b>
            <p>
              Experience streamlined appointment scheduling and a hassle-free process to connect with healthcare providers.
            </p>
          </div>
          <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] bg-white hover:bg-indigo-500 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-md">
            <b>ACCESSIBILITY</b>
            <p>
              Explore a wide network of trusted specialists and healthcare facilities tailored to your needs.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
