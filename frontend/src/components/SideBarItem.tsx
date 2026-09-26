import type { ReactElement } from 'react';

function SideBarItem({ text, icon }: { text: string; icon: ReactElement }) {
  return (
    <div className='flex text-gray-700 items-center cursor-pointer hover:bg-gray-100 rounded'>
      <div className="p-2">{icon}</div>
      <div>{text}</div>
    </div>
  );
}

export default SideBarItem;
