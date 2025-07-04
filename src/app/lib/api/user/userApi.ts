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
