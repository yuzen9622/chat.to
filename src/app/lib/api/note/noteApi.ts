import { NoteInterface } from "@/types/type";

export const fetchFriendNote = async (
  userIds: string[]
): Promise<NoteInterface[]> => {
  try {
    // const userIds = friends.map((f) => f.user.id);
    const response = await fetch("/api/note", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: userIds }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateNote = async (
  noteText: string,
  userId: string
): Promise<NoteInterface> => {
  try {
    const res = await fetch("/api/note/update", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: noteText,
        is_public: true,
        user_id: userId,
      }),
    });
    const data: NoteInterface = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteNote = async (noteId: number) => {
  try {
    const res = await fetch("/api/note/delete", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw data.error;
    }
  } catch (error) {
    throw error;
  }
};
