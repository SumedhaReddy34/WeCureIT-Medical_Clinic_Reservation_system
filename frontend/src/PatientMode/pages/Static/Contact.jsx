import React from 'react';
import Header from '../../components/Header'; // Adjust path based on your project structure
import Footer from '../../components/Footer'; // Adjust path based on your project structure

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-grow px-6 md:px-12 lg:px-20">
        {/* Contact Us Heading */}
        <div className="text-center text-2xl pt-10 text-[#707070]">
          <p>
            CONTACT <span className="text-gray-700 font-semibold">US</span>
          </p>
        </div>

        {/* Contact Details */}
        <div className="my-10 flex flex-col justify-center items-start gap-6 text-sm text-gray-600 mb-28">
          <p className="font-semibold text-lg text-gray-700">OUR OFFICE</p>
          <p>
            Foggy Bottom Station <br /> Washington DC, USA
          </p>
          <p>
            Tel: +1 (123) 555-0101 <br /> Email: cbesteam3gwu@gmail.com
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
