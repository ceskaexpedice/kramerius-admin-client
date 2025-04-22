export type FilterType = '+' | '-';


export interface Filter {
  // selected facetval 
  facetval: FacetValue;
  // type of selection
  type: FilterType;
}

// all current elected filters 
/* groupname - filter */
export interface FacetFilters {
  [key: string]: Filter;
}


export interface FacetValue {
  // parent group
  groupid: string;

  // labels
  filterKey: string;
  // node_1
  filterVal:string;
  // name = node_1
  name:string;
  // node_1 number
  value:number;
}

export interface FacetsGroup {
  // groupName (workers, labels, resources = [all_facet_values])
  [key:string]:FacetValue[];
}