"use server";

export async function fetchFoodsAction(category: string = "all") {
  try {
    const params = new URLSearchParams();
    if (category !== "all") params.append("category", category);

    const response = await fetch(`http://localhost:8089/api/v1/foods?${params}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to fetch foods" };
  }
}