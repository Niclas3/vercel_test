'use client';

import{MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import{useSearchParams, usePathname, useRouter} from 'next/navigation';

export default function Search({placeholder} : {placeholder : string}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  function debounce(func:(arg0:any)=>void, time: number){
          let timer;
          clearTimeout(timer);
          return function(args:any){
                setTimeout(()=>{
                        func(args);
                }, time);
          }
  }

  function handleSearch(term : string) {
    const params = new URLSearchParams(searchParams);
    console.log(term);
    params.set('page', '1');

    if(term) {
            params.set('query', term);
    } else {
            params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => { debounce(handleSearch, 40)(e.target.value); } }
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
