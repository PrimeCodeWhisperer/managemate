import { create } from 'zustand';
import { Availability } from '../lib/definitions';

type State={
    availabilityList:Availability[]
    updateAvailabilityList:(availabilityList:State['availabilityList'])=>void
}
export const useAvailabilities=create<State>()((set)=>({
    availabilityList:[],
    updateAvailabilityList:(availabilityList)=>set(()=>({availabilityList:availabilityList}))
}))