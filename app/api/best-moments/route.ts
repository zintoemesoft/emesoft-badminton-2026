import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';

const ORDER_FILE = 'order.json';

type OrderData = {
    order: string[];
    stars?: string[];
};

export async function GET() {
    try {
        const directoryPath = path.join(process.cwd(), 'public', 'best-moments');
        const orderFilePath = path.join(directoryPath, ORDER_FILE);
        
        if (!fs.existsSync(directoryPath)) {
            return NextResponse.json({ images: [], stars: [] });
        }

        const files = fs.readdirSync(directoryPath);
        const images = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        let orderedImages = [...images];
        let stars: string[] = [];

        try {
            if (fs.existsSync(orderFilePath)) {
                const fileContent = await readFile(orderFilePath, 'utf-8');
                const data = JSON.parse(fileContent) as OrderData;
                const savedOrder = data.order || [];
                stars = data.stars || [];
                
                // Create a set for quick lookup
                const imageSet = new Set(images);
                
                // Filter order list to only include existing files
                const validOrder = savedOrder.filter(img => imageSet.has(img));
                
                // Find images that are not in the order list (newly added)
                const orderedSet = new Set(validOrder);
                const newImages = images.filter(img => !orderedSet.has(img));
                
                // Combine: Ordered ones first, then new ones
                orderedImages = [...validOrder, ...newImages];
                
                // Cleanup stars valid list
                stars = stars.filter(img => imageSet.has(img));
            }
        } catch (e) {
            console.error("Error reading order file:", e);
        }

        return NextResponse.json({ images: orderedImages, stars });
    } catch (error) {
        return NextResponse.json({ images: [], stars: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'best-moments');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({ success: true, filename });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { order, stars } = body;
        
        const directoryPath = path.join(process.cwd(), 'public', 'best-moments');
        if (!fs.existsSync(directoryPath)) {
             fs.mkdirSync(directoryPath, { recursive: true });
        }
        
        const orderFilePath = path.join(directoryPath, ORDER_FILE);
        
        // Read existing data to merge if partial update (though we usually send full state)
        let currentData: OrderData = { order: [], stars: [] };
        try {
            if (fs.existsSync(orderFilePath)) {
                currentData = JSON.parse(await readFile(orderFilePath, 'utf-8'));
            }
        } catch (e) {}

        const newData = {
            order: order !== undefined ? order : currentData.order,
            stars: stars !== undefined ? stars : currentData.stars
        };

        await writeFile(orderFilePath, JSON.stringify(newData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save data error:', error);
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { filename } = await request.json();
        if (!filename) {
            return NextResponse.json({ error: 'Filename required' }, { status: 400 });
        }

        const filepath = path.join(process.cwd(), 'public', 'best-moments', filename);
        
        if (!filepath.includes('public\\best-moments') && !filepath.includes('public/best-moments')) {
             return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
        }

        await unlink(filepath);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
