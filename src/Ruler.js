import React, { useEffect, useState } from 'react';

const Ruler = ({ currentYear }) => {
  const startYear = 1950;
  const endYear = 2021;
  const step = 4; // Show every 4 years
  const totalYears = endYear - startYear;
  const totalSteps = totalYears / step;

  // Calculate the position of the arrow based on the current year
  const arrowPosition = ((currentYear - startYear) / totalYears) * 100;

  // State to hold whether the screen is small
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 815);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 815);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate the position of the arrow based on the current year

  return (
    <div className='relative mt-10 scale-90'>
      <div className='flex justify-between w-full relative border-b-2 border-black pb-2'>
        {Array.from({ length: totalSteps + 1 }, (_, index) => {
          const year = startYear + index * step;

          // Show year labels every 12 years if the screen width is small
          const shouldDisplayYear = isSmallScreen ? index % 3 === 0 : true; // Display every third year for small screens

          return (
            <div
              key={year}
              className='relative text-center w-[calc(100%/(totalSteps+1))]'
            >
              {shouldDisplayYear && (
                <span className='absolute top-[-40px] text-sm'>{year}</span>
              )}
              <div className='absolute bottom-0 left-[50%] transform -translate-x-1/2 h-4 w-[2px] bg-black' />
            </div>
          );
        })}
      </div>
      {/* Arrow indicator pointing to the scale line */}
      <div
        className='absolute'
        style={{
          left: `${arrowPosition}%`,
          bottom: '0',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '10px solid gray', // Arrow color
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};

export default Ruler;
