import React from 'react';

const Footer = () => {
  return (
    <div className="md:mx-10">
      {/* Main footer content */}
      <div className="flex flex-col md:flex-row justify-between gap-14 my-10 mt-40 text-sm">
        
        {/* Description Section */}
        <div className="md:w-2/3">
          <p className="text-gray-600 leading-6">
            We Cure It is revolutionizing the way patients connect with healthcare providers. From booking appointments with top specialists to finding the right facility or scheduling by date and doctor, our platform ensures a streamlined and stress-free experience. Trusted by countless patients, We Cure It is your partner in achieving better health, one appointment at a time.
          </p>
        </div>
        
        {/* Get in Touch Section */}
        <div className="md:w-1/3 text-right">
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+1-123 456 7890</li>
            <li>component-based@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2024 @ WeCureIt.com - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
