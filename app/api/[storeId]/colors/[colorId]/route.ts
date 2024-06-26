import { db } from "@/lib/firebase/firebase-config";
import { auth } from "@clerk/nextjs";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET (
  _req: Request,
  { params }: { params: { storeId: string, colorId: string } }
) {
  try {
    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const colorRef = doc(db, 'stores', params.storeId, 'colors', params.colorId);
    const colorDoc = await getDoc(colorRef);
    const colorData = colorDoc.data();

    return NextResponse.json({
      ...colorData,
      id: colorDoc.id,
    });
  } catch (error) {
    console.log('[COLOR_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { storeId: string, colorId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const storeRef = doc(db, 'stores', params.storeId);
    const storeDoc = await getDoc(storeRef);
    const storeData = storeDoc.data();

    if (storeData?.userId != userId){
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const colorRef = doc(db, 'stores', params.storeId, 'colors', params.colorId);
    const colorDoc = await getDoc(colorRef);
    const colorData = colorDoc.data();

    if (storeData?.userId === userId) {
      await updateDoc(colorRef, { 
      ...colorData,
      name: name,
      value: value,
      updatedAt: serverTimestamp(), 
      });
    }

    return NextResponse.json(colorData);
  } catch (error) {
    console.log('[COLOR_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE (
  _req: Request,
  { params }: { params: { storeId: string, colorId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const storeRef = doc(db, 'stores', params.storeId);
    const storeDoc = await getDoc(storeRef);
    const colorRef = doc(db, 'stores', params.storeId, 'colors', params.colorId);
    const colorDoc = await getDoc(colorRef);

    if (storeDoc.data()?.userId == userId) {
      deleteDoc(colorRef);
    }

    return NextResponse.json(colorDoc.data());
  } catch (error) {
    console.log('[COLOR_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}