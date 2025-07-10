export const getAllUserById = async (userIds: string[]) => {
  try {
    const res = await fetch("/api/users", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userIds }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw data.error;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const queryUsers = async (query: string, userId: string) => {
  try {
    if (!query) return null;
    const response = await fetch("/api/users/q", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        userId,
        query,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
