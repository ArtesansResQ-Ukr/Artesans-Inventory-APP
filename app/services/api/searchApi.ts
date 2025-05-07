import Fuse from 'fuse.js';

export interface FuseSearchItem {
    [key: string]: string | undefined | null;
  }
  
interface FuzzySearchOptions<T> {
    list: T[];
    keys: string[];
    query: string;
    threshold?: number;
}
  
export const fuzzySearch = <T extends FuseSearchItem>({list, keys, query, threshold = 0.6}:  
    FuzzySearchOptions<T>): T[] => {
        if (!query || query.trim() === '') return list;
      
        const fuse = new Fuse(list, {
            keys,
            threshold,
            includeScore: true,
      });
      
      const results = fuse.search(query);
      return results.map((result) => result.item);
  };

export const normalize = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };