export type User = {
    id: string;
    username: string;
    first_name:string;
    last_name:string;
    avatar_url:string;
    email: string;
    role:string;
  };
export type Shift={
    id?:number;
    user_id?:string;
    date:string;
    start_time:string;
    end_time?:string;
    status?:string;
}
export type UpcomingShift={
    id?:number;
    user_id?:string;
    date:string;
    start_time:string;
}
export type PastShift={
    id?:number;
    user_id?:string;
    date:string;
    start_time:string;
    end_time:string;
}
export type AdminShiftInfo={
    workers:User[];
    workerIDs:string[];
    date_start_time:Date;
    date_end_time:Date;
}
export type Employee={
    id:string;
    avatar_url:string;
    email:string;
    username:string;
    first_name:string;
    last_name:string;
    company_id?:string;

}
// Pending employees awaiting approval/activation
export type PendingEmployee = {
    id: string;
    email: string;
    username?: string
};
export type Availability= {
    week_start: string;
    availability: {
      [key: string]: { start: string; end: string }[];
    };
    employee?: Employee;
}
export type AvailabilityTable= {
    id: string;
    employee_id: string;
    week_start:Date;
    availability: {
      [key: string]: { start: string; end: string }[];
    };
}

export type TimeSpan = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
};