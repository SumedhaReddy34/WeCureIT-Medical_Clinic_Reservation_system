import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/9d47167c648b08011457fb8422c23ccb0faf5e34a75cfbc99d35d21986eda059?placeholderIfAbsent=true&apiKey=8f0d2cc9bf764b679624a1d309a49f82",
    label: "Dashboard",
    path: "/doctor-dashboard",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e5cb9e928db17c33dce2e1ad7079e7a4bccbda4a3aa219111a3096dc910c1db3?placeholderIfAbsent=true&apiKey=8f0d2cc9bf764b679624a1d309a49f82",
    label: "Appointments",
    path: "/appointments",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba35dadaadfd93ef4f8883dffa15f20a687819f4a7729e9efaf6400b5c860ce7?placeholderIfAbsent=true&apiKey=8f0d2cc9bf764b679624a1d309a49f82",
    label: "Availability Changes",
    path: "/availability",
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <nav className="flex flex-col pt-5 pr-px mt-0 max-w-full bg-white border-r border-solid min-h-[916px] pb-[688px] min-w-[289px] max-md:pb-24 max-md:mt-0">
      <ul className="flex flex-col w-full">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`flex gap-3 items-center py-3.5 pr-10 pl-9 w-full ${
              location.pathname === item.path
                ? 'bg-violet-50 border-r-4 border-solid border-r-indigo-500 text-indigo-600 cursor-not-allowed'
                : 'hover:bg-indigo-50 hover:border-r-indigo-300 cursor-pointer'
            }`}
          >
            <Link to={item.path} className="flex items-center gap-3 w-full h-full">
              <img
                loading="lazy"
                src={item.icon}
                alt={item.label}
                className="object-contain w-6 aspect-square"
              />
              <span className="self-stretch my-auto text-base font-thin leading-6 text-neutral-600">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
