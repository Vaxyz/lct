import { baseApi } from '../../app/baseApi'
export type StudyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type StudyLesson = { id?: string; lessonNumber: number; title: string; scriptureReference?: string; teachingNotes?: string; discussionQuestions?: string; reflectionPrompt?: string }
export type StudyGuide = { id: string; title: string; slug: string; topic?: string; seriesName?: string; summary?: string; status?: StudyStatus; lessonCount?: number; lessons?: StudyLesson[] }
type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string }
export const bibleStudyApi = baseApi.injectEndpoints({ endpoints: (b) => ({
 getStudies: b.query<ApiResponse<StudyGuide[]>, {q?:string;topic?:string}|void>({query:(params)=>({url:'/v1/bible-study',params:params||undefined}),providesTags:['Devotionals']}),
 getStudy: b.query<ApiResponse<StudyGuide>,string>({query:(id)=>`/v1/bible-study/${id}`,providesTags:['Devotionals']}),
 getAdminStudies: b.query<ApiResponse<StudyGuide[]>,void>({query:()=>'/v1/bible-study/admin',providesTags:['Devotionals']}),
 saveStudy: b.mutation<ApiResponse<StudyGuide>,Partial<StudyGuide>&Pick<StudyGuide,'title'>>({query:(body)=>({url:'/v1/bible-study/admin',method:'POST',body}),invalidatesTags:['Devotionals']}),
 updateStudy: b.mutation<ApiResponse<StudyGuide>,{id:string;body:Partial<StudyGuide>&Pick<StudyGuide,'title'>}>({query:({id,body})=>({url:`/v1/bible-study/admin/${id}`,method:'PUT',body}),invalidatesTags:['Devotionals']}),
 saveLesson: b.mutation<ApiResponse<StudyLesson>,{id:string;body:StudyLesson}>({query:({id,body})=>({url:`/v1/bible-study/admin/${id}/lessons`,method:'POST',body}),invalidatesTags:['Devotionals']}),
 deleteLesson: b.mutation<ApiResponse<null>,{id:string;lessonId:string}>({query:({id,lessonId})=>({url:`/v1/bible-study/admin/${id}/lessons/${lessonId}`,method:'DELETE'}),invalidatesTags:['Devotionals']}),
})})
export const {useGetStudiesQuery,useGetStudyQuery,useGetAdminStudiesQuery,useSaveStudyMutation,useUpdateStudyMutation,useSaveLessonMutation,useDeleteLessonMutation}=bibleStudyApi
