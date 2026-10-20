import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        {
          success: false,
          message: "Latitude and longitude are required.",
        },
        { status: 400 }
      );
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coordinates.",
        },
        { status: 400 }
      );
    }

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      `&zoom=18` +
      `&addressdetails=1` +
      `&accept-language=en`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "MarketLink/1.0 (marketplace delivery application)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Geocoding service returned ${response.status}.`
      );
    }

    const data = await response.json();

    const address = data.address || {};

    const state =
      address.state ||
      address.region ||
      "";

    const lga =
      address.county ||
      address.state_district ||
      address.municipality ||
      "";

    const town =
      address.city ||
      address.town ||
      address.city_district ||
      address.village ||
      address.municipality ||
      "";

    const area =
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.district ||
      "";

    const road =
      address.road ||
      address.pedestrian ||
      address.footway ||
      "";

    const houseNumber =
      address.house_number || "";

    const landmark =
      address.amenity ||
      address.shop ||
      address.tourism ||
      address.building ||
      "";

    const formattedAddress = [
      houseNumber,
      road,
    ]
      .filter(Boolean)
      .join(" ");

    const fallbackAddress =
      formattedAddress ||
      data.display_name ||
      "";

    return NextResponse.json({
      success: true,
      location: {
        latitude,
        longitude,
        state,
        lga,
        town,
        area,
        address: fallbackAddress,
        landmark,
        displayName:
          data.display_name || fallbackAddress,
      },
    });
  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "We found your GPS location but could not convert it into a full address. Please enter your address manually.",
      },
      { status: 500 }
    );
  }
}