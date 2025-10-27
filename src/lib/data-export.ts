import { createClient } from "@/utils/supabase/server";

/**
 * Exports user data for GDPR data portability requests
 * This should be called from an admin interface or API endpoint
 */
export async function exportUserData(userId: string) {
  const supabase = createClient();
  
  try {
    // User profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // User availability data
    const { data: availabilities } = await supabase
      .from('availabilities')
      .select('*')
      .eq('employee_id', userId);

    // User shift data (past and upcoming)
    const { data: pastShifts } = await supabase
      .from('past_shifts')
      .select('*')
      .eq('employee_id', userId);

    const { data: upcomingShifts } = await supabase
      .from('upcoming_shifts')
      .select('*')
      .eq('employee_id', userId);

    // Vacation requests
    const { data: vacationRequests } = await supabase
      .from('vacations_requests')
      .select('*')
      .eq('employee_id', userId);

    // Open shifts applied to
    const { data: openShifts } = await supabase
      .from('open_shifts')
      .select('*')
      .eq('employee_id', userId);

    // Compile all data
    const userData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      profile: profile || {},
      workData: {
        availabilities: availabilities || [],
        pastShifts: pastShifts || [],
        upcomingShifts: upcomingShifts || [],
        vacationRequests: vacationRequests || [],
        openShifts: openShifts || [],
      },
      metadata: {
        exportedBy: 'ManageMate GDPR Export',
        totalRecords: {
          availabilities: availabilities?.length || 0,
          pastShifts: pastShifts?.length || 0,
          upcomingShifts: upcomingShifts?.length || 0,
          vacationRequests: vacationRequests?.length || 0,
          openShifts: openShifts?.length || 0,
        }
      }
    };

    return {
      success: true,
      data: userData,
      filename: `managemate-data-export-${userId}-${Date.now()}.json`
    };

  } catch (error) {
    console.error('Error exporting user data:', error);
    return {
      success: false,
      error: 'Failed to export user data'
    };
  }
}

/**
 * Deletes user data for GDPR erasure requests
 * This should be called from an admin interface or API endpoint
 * WARNING: This permanently deletes user data
 */
export async function deleteUserData(userId: string, options: {
  keepHistoricalData?: boolean;
  anonymizeInsteadOfDelete?: boolean;
} = {}) {
  const supabase = createClient();
  
  try {
    const deletionLog = {
      userId,
      deletedAt: new Date().toISOString(),
      deletedTables: [] as string[]
    };

    if (options.anonymizeInsteadOfDelete) {
      // Anonymize profile data instead of deleting
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: '[DELETED]',
          last_name: '[USER]',
          email: `deleted-user-${userId}@anonymized.local`,
          phone: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (!profileError) deletionLog.deletedTables.push('profiles (anonymized)');
    } else {
      // Complete deletion
      
      // Delete availabilities
      const { error: availError } = await supabase
        .from('availabilities')
        .delete()
        .eq('employee_id', userId);
      if (!availError) deletionLog.deletedTables.push('availabilities');

      // Delete upcoming shifts
      const { error: upcomingError } = await supabase
        .from('upcoming_shifts')
        .delete()
        .eq('employee_id', userId);
      if (!upcomingError) deletionLog.deletedTables.push('upcoming_shifts');

      // Handle past shifts based on options
      if (!options.keepHistoricalData) {
        const { error: pastShiftsError } = await supabase
          .from('past_shifts')
          .delete()
          .eq('employee_id', userId);
        if (!pastShiftsError) deletionLog.deletedTables.push('past_shifts');
      }

      // Delete vacation requests
      const { error: vacationError } = await supabase
        .from('vacations_requests')
        .delete()
        .eq('employee_id', userId);
      if (!vacationError) deletionLog.deletedTables.push('vacations_requests');

      // Delete open shift applications
      const { error: openShiftError } = await supabase
        .from('open_shifts')
        .delete()
        .eq('employee_id', userId);
      if (!openShiftError) deletionLog.deletedTables.push('open_shifts');

      // Finally, delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (!profileError) deletionLog.deletedTables.push('profiles');
    }

    return {
      success: true,
      deletionLog
    };

  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      success: false,
      error: 'Failed to delete user data'
    };
  }
}

/**
 * Gets data retention info for a user
 */
export async function getUserDataRetention(userId: string) {
  const supabase = createClient();
  
  try {
    // Get user's last activity
    const { data: profile } = await supabase
      .from('profiles')
      .select('updated_at, created_at')
      .eq('id', userId)
      .single();

    // Get latest shift activity
    const { data: latestShift } = await supabase
      .from('past_shifts')
      .select('created_at')
      .eq('employee_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const accountCreated = new Date(profile?.created_at || '');
    const lastActivity = new Date(profile?.updated_at || profile?.created_at || '');
    const lastShift = latestShift ? new Date(latestShift.created_at) : null;
    
    // Calculate retention periods (example: 7 years for employment data)
    const employmentDataRetentionEnd = new Date(lastShift || lastActivity);
    employmentDataRetentionEnd.setFullYear(employmentDataRetentionEnd.getFullYear() + 7);
    
    return {
      accountCreated,
      lastActivity,
      lastShift,
      retentionPeriods: {
        employmentData: {
          description: 'Employment and payroll data',
          retentionEnd: employmentDataRetentionEnd,
          legalBasis: 'Dutch employment law and tax requirements'
        },
        personalData: {
          description: 'Profile and contact information',
          retentionEnd: lastActivity,
          legalBasis: 'User account maintenance'
        }
      }
    };
  } catch (error) {
    console.error('Error getting retention info:', error);
    return null;
  }
}