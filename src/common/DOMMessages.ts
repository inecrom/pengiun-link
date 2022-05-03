export type DOMMessage = {
    type: 'GET_DOM'
  }
  
  export type DOMMessageResponse = {
    location: string;
    title: string;
    headlines: string[];
  }