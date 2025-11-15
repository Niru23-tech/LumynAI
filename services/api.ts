import { supabase } from './supabaseClient';
import { Role, AppointmentStatus, User, Appointment, JournalEntry, Message, Conversation, Resource } from '../types';

// --- Data Mapping Functions ---
const mapDbUserToUser = (dbUser: any): User => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    avatarUrl: dbUser.avatar_url,
});

const mapDbAppointmentToAppointment = (dbApp: any): Appointment => ({
    id: dbApp.id,
    studentId: dbApp.student_id,
    studentName: dbApp.student.name,
    counsellorId: dbApp.counsellor_id,
    counsellorName: dbApp.counsellor.name,
    dateTime: new Date(dbApp.date_time),
    status: dbApp.status,
    notes: dbApp.notes || '',
    reminder: dbApp.reminder,
    feedback: dbApp.feedback_rating ? { rating: dbApp.feedback_rating, comment: dbApp.feedback_comment } : undefined,
});

const mapDbJournalToJournal = (dbJournal: any): JournalEntry => ({
    id: dbJournal.id,
    studentId: dbJournal.student_id,
    title: dbJournal.title,
    content: dbJournal.content,
    createdAt: new Date(dbJournal.created_at),
});

const mapDbMessageToMessage = (dbMessage: any): Message => ({
    id: dbMessage.id,
    senderId: dbMessage.sender_id,
    receiverId: dbMessage.receiver_id,
    text: dbMessage.text,
    timestamp: new Date(dbMessage.timestamp),
    status: dbMessage.status,
});

const mapDbResourceToResource = (dbResource: any): Resource => ({
    id: dbResource.id,
    title: dbResource.title,
    summary: dbResource.summary,
    content: dbResource.content,
    imageUrl: dbResource.image_url,
});


// --- API FUNCTIONS ---

// Users
export const getUsers = async (role?: Role): Promise<User[]> => {
    let query = supabase.from('users').select('*');
    if (role) {
        query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapDbUserToUser);
};

export const getCounsellors = async (): Promise<User[]> => {
    return getUsers(Role.COUNSELLOR);
}

// Appointments
export const getStudentAppointments = async (studentId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`*, student:users!student_id(name), counsellor:users!counsellor_id(name)`)
        .eq('student_id', studentId)
        .order('date_time', { ascending: false });

    if (error) throw error;
    return data.map(mapDbAppointmentToAppointment);
};

export const getCounsellorAppointments = async (counsellorId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`*, student:users!student_id(name), counsellor:users!counsellor_id(name)`)
        .eq('counsellor_id', counsellorId)
        .order('date_time', { ascending: false });

    if (error) throw error;
    return data.map(mapDbAppointmentToAppointment);
};

export const bookAppointment = async (studentId: string, counsellorId: string, dateTime: Date, reminder: '15 minutes' | '1 hour' | '1 day' | null): Promise<Appointment> => {
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            student_id: studentId,
            counsellor_id: counsellorId,
            date_time: dateTime.toISOString(),
            reminder: reminder,
            status: AppointmentStatus.PENDING,
        })
        .select(`*, student:users!student_id(name), counsellor:users!counsellor_id(name)`)
        .single();
    
    if (error) throw error;
    return mapDbAppointmentToAppointment(data);
};

export const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select(`*, student:users!student_id(name), counsellor:users!counsellor_id(name)`)
        .single();

    if (error) throw error;
    return mapDbAppointmentToAppointment(data);
};

export const submitAppointmentFeedback = async (appointmentId: string, rating: number, comment: string): Promise<Appointment> => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ feedback_rating: rating, feedback_comment: comment })
        .eq('id', appointmentId)
        .select(`*, student:users!student_id(name), counsellor:users!counsellor_id(name)`)
        .single();
    
    if (error) throw error;
    return mapDbAppointmentToAppointment(data);
};

// Journal
export const getStudentJournal = async (studentId: string): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapDbJournalToJournal);
};

export const addJournalEntry = async (studentId: string, title: string, content: string): Promise<JournalEntry> => {
    const { data, error } = await supabase
        .from('journal_entries')
        .insert({ student_id: studentId, title, content })
        .select()
        .single();

    if (error) throw error;
    return mapDbJournalToJournal(data);
};

// Chat
export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;

    const conversationsMap: Map<string, Conversation> = new Map();
    const otherUserIds = new Set<string>();

    messages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        otherUserIds.add(otherUserId);
    });
    
    if(otherUserIds.size === 0) return [];

    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', Array.from(otherUserIds));

    if (userError) throw userError;

    const currentUser = (await supabase.from('users').select('*').eq('id', userId).single()).data;
    if(!currentUser) return [];

    users.forEach(u => {
        const convo: Conversation = {
            id: `${userId}-${u.id}`,
            participant1: mapDbUserToUser(currentUser),
            participant2: mapDbUserToUser(u),
            messages: []
        };
        conversationsMap.set(u.id, convo);
    });

    messages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const convo = conversationsMap.get(otherUserId);
        if (convo) {
            convo.messages.push(mapDbMessageToMessage(msg));
        }
    });

    return Array.from(conversationsMap.values()).map(convo => {
        convo.messages.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
        return convo;
    });
};

export const sendMessage = async (senderId: string, receiverId: string, text: string): Promise<Message> => {
    const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: senderId, receiver_id: receiverId, text })
        .select()
        .single();

    if (error) throw error;
    return mapDbMessageToMessage(data);
};

// Resources
export const getResources = async (): Promise<Resource[]> => {
    const { data, error } = await supabase.from('resources').select('*');
    if (error) throw error;
    return data.map(mapDbResourceToResource);
};
