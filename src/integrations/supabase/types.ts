
      lunaria_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          done: boolean
          due_date: string | null
          created_at: string
          task_type: string
          status: string
          progress: number
          completed_at: string | null
          labels: string[]
          assigned_by: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string
          done?: boolean
          due_date?: string | null
          created_at?: string
          task_type?: string
          status?: string
          progress?: number
          completed_at?: string | null
          labels?: string[]
          assigned_by?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          done?: boolean
          due_date?: string | null
          created_at?: string
          task_type?: string
          status?: string
          progress?: number
          completed_at?: string | null
          labels?: string[]
          assigned_by?: string
        }
        Relationships: []
            }
            
