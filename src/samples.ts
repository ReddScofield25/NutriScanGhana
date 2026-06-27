import { FoodScanResult } from "./types";

export interface SampleFood {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  result: FoodScanResult;
}

export const SAMPLE_FOODS: SampleFood[] = [
  {
    id: "red-red",
    name: "Red Red (Bean Stew & Fried Plantains)",
    description: "A cherished Ghanaian comfort dish made of black-eyed peas stewed in red palm oil and served with sweet fried plantains.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80", // Premium healthy plate thumbnail
    result: {
      isFoodAsset: true,
      foodName: "Red Red with Fried Plantains",
      healthGrade: "A",
      sustainabilityScore: 9,
      dietaryContext: "Red Red is an exceptional, protein-rich staple of Ghanaian cuisine. Sourced from indigenous black-eyed peas, it delivers high soluble fiber and clean complex carbs. The addition of ripe plantains provides healthy potassium and vitamins. It represents the pinnacle of sustainable, plant-forward West African diets when cooked with moderate oil.",
      warningFlags: [
        {
          text: "Palm Oil Saturated Fat: High amount of palm oil can increase saturated fat intake if not drained or if used in excess.",
          severity: "amber"
        }
      ],
      recommendedAlternatives: [
        {
          name: "Shallow Frying or Baking Plantains",
          reason: "Reduces total fat and calorie intake substantially while maintaining sweet natural flavor and crispy edges."
        },
        {
          name: "Incorporate Kontomire (Cocoyam Leaves)",
          reason: "Serving with a side of steamed kontomire adds massive iron, folate, vitamin A, and fiber to the meal."
        }
      ],
      summary: "An incredibly healthy, traditional plant-forward meal that supports local Ghanaian agriculture. Excellent fiber and plant protein, with just minor caution on palm oil portioning."
    }
  },
  {
    id: "instant-noodles",
    name: "Instant Noodles with Fried Egg & Sausage",
    description: "A quick, highly processed packaged food that has become popular among urban youth but carries high sodium and low nutrients.",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80", // Instant noodles thumbnail
    result: {
      isFoodAsset: true,
      foodName: "Packaged Instant Noodles with Processed Sausage & Egg",
      healthGrade: "D-",
      sustainabilityScore: 3,
      dietaryContext: "Instant noodles represent a significant departure from traditional whole foods in Ghana. They consist primarily of refined wheat flour, palm olein, and excessive synthetic seasonings. This combination results in massive sodium loads, negligible fiber, and high systemic inflammatory potential.",
      warningFlags: [
        {
          text: "Extreme Sodium Hazard: A single packet contains over 80% of the recommended daily allowance, posing risks to blood pressure.",
          severity: "red"
        },
        {
          text: "Ultra-Processed Meat: The sausage contains carcinogenic preservatives (nitrites) and low-quality saturated fats.",
          severity: "red"
        },
        {
          text: "High Plastic Footprint: Single-use multi-layer plastic packaging is highly unsustainable and rarely recycled in local Ghanaian municipalities.",
          severity: "amber"
        }
      ],
      recommendedAlternatives: [
        {
          name: "Egg & Vegetable Gari Foto",
          reason: "A traditional fast meal made from local cassava grit (gari) tossed with fresh tomatoes, onions, peppers, and eggs. Packed with fiber and zero preservatives."
        },
        {
          name: "Ghanaian Brown Millet Noodles",
          reason: "Millet is an indigenous, highly drought-resistant super-grain. Millet noodles support local dryland farmers, have a low glycemic index, and are rich in zinc and magnesium."
        }
      ],
      summary: "A heavily processed meal with alarming sodium content and high environmental packaging waste. Highly recommended to swap for local, whole-grain alternatives."
    }
  },
  {
    id: "fufu-goat",
    name: "Fufu with Light Soup & Goat Meat",
    description: "A staple Sunday delicacy in Ghana. Freshly pounded cassava and green plantain served in an aromatic, spicy tomato broth with goat meat.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", // Soup and meat bowl thumbnail
    result: {
      isFoodAsset: true,
      foodName: "Fufu with Light Soup and Local Goat Meat",
      healthGrade: "B+",
      sustainabilityScore: 8,
      dietaryContext: "Fufu is a core traditional energetic meal, but portion control is critical. When paired with light soup, it is rich in hydration, vitamins from fresh garden eggs (African eggplant), ginger, and lean protein from locally raised grass-fed goat meat. Traditional light soup is excellent for digestion and immune wellness due to high garlic and pepper.",
      warningFlags: [
        {
          text: "Carbohydrate Density: Large portion sizes of fufu can cause rapid postprandial glucose spikes. Consider moderating the dough size.",
          severity: "amber"
        },
        {
          text: "MSG/Sodium in Bouillon: Standard commercial seasoning cubes are frequently overused in local soups, raising sodium content.",
          severity: "amber"
        }
      ],
      recommendedAlternatives: [
        {
          name: "Add Dawadawa (Fermented African Locust Bean)",
          reason: "Using traditional dawadawa as the flavor base reduces the need for sodium-heavy bullion cubes while introducing gut-healthy probiotics and natural cardio-protective factors."
        },
        {
          name: "Portion Scaling (2:1 Soup-to-Fufu ratio)",
          reason: "Requesting a smaller fufu portion and double the vegetable-rich broth with extra garden eggs increases dietary fiber and moderates insulin impact."
        }
      ],
      summary: "A superb, nourishing traditional meal celebrating local Ghanaian ingredients. Highly sustainable and nutritious if portion sizes and soup sodium are kept balanced."
    }
  }
];
