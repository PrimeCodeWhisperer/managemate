import { create } from 'zustand';
import {  Employee } from '../lib/definitions';

type State={
    employees?:Employee[]
    updateEmployeesList:(availabilityList:State['employees'])=>void
}
export const useEmployees=create<State>()((set)=>({
    employees:[],
    updateEmployeesList:(employees)=>set(()=>({employees:employees}))
}))