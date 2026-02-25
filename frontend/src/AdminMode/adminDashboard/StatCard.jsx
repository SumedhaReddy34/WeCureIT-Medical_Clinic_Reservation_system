import React from 'react';

function StatCard({ icon, count, label }) {
  return (
    <div className="flex gap-2 py-5 pr-11 pl-5 w-52 bg-white rounded border-2 border-gray-100 border-solid max-md:pr-5">
      <img 
        loading="lazy" 
        src={icon} 
        alt="" 
        className="object-contain w-14 aspect-[1.02]" 
      />
      <div className="flex flex-col my-auto font-thin whitespace-nowrap">
        <div className="self-start text-xl leading-7 text-gray-600">{count}</div>
        <div className="mt-3.5 text-base leading-6 text-gray-400">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;
