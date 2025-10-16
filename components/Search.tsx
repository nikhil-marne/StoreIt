"use client"

import Image from "next/image"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { getFiles } from "@/lib/actions/file.action"
import Thumbnail from "./Thumbnail"
import FormattedDateTime from "./FormattedDateTime"

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FileDocument[]>([]);
    const [open, setOpen] = useState(false);
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("query") || "";
    const router = useRouter();
    const path = usePathname();

    // CRITICAL FIX: Debounce implementation with clean dependency on [query]
    useEffect(() => {
        // 1. Clear results if query is empty or too short.
        if (query.length < 2) { 
            setResults([]);
            setOpen(false);
            return router.push(path.replace(searchParams.toString(), ''))
            // If query is totally empty, stop here.
            if (query.length === 0) return; 
        }

        const fetchFiles = async () => {
            try {
                
                const files = await getFiles({types: [], searchText: query});
                setResults(files.documents as FileDocument[]);
                setOpen(true);

            } catch (error) {
                console.error("Search failed:", error);
                setResults([]); 
                setOpen(false);
            }
        }
        
        const timeoutId = setTimeout(fetchFiles, 300); 
        return () => clearTimeout(timeoutId); 
        
    }, [query]);

    useEffect(() => {
        if(!searchQuery) {
            setQuery("");
        }
    }, [searchQuery]);

    const handleClickItem = (file: FileDocument) => {
      setOpen(false);
      setResults([]);

      router.push(`/${(file.type === 'video' || file.type === 'audio') ? 'media' : file.type + 's'}?query=${query}`)
    }

    return (
        <div className="search">
            <div className="search-input-wrapper">
                <Image src="/assets/icons/search.svg" alt="Search" width={24} height={24} />

                <Input 
                value={query}
                placeholder="Search..."
                className="search-input"
                onChange={(e) => setQuery(e.target.value)} />
                {open && (
                    <ul className="search-result">
                        {results.length > 0 ? (
                            results.map(file => (
                                <li className="flex items-center justify-between"
                                 key={file.$id}
                                 onClick={() => handleClickItem(file)}>
                                  <div className="flex cursor-pointer items-center gap-4">
                                    <Thumbnail type={file.type} 
                                    extension={file.extension}
                                    url={file.url}
                                    className="size-9 min-w-9" />
                                    <p className="subtitle-2 line-clamp-1 text-light-100">{file.name}</p>
                                  </div>
                                  <FormattedDateTime 
                                  date={file.$createdAt}
                                  className="caption line-clamp-1 text-light-200" />
                                </li>
                            ))
                        ) : <p className="empty-result">No files found.</p>}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default Search