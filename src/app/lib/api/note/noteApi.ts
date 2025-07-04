export const fetchFriendNote = async (userIds: string[]) => {
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
