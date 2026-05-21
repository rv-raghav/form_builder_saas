import { api } from './auth';
import { API_ENDPOINTS } from '../config/api';
import { API_BASE_URL } from '../config/api';

export type ProcessPayload = {
    platform: string;
    base_duration: number;
    overlay: string | null;
    video_overlays: (string | null)[];
};

const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024;

const throwIfTooLarge = (file: File, label: string) => {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error(`${label} ${file.name} exceeds 10MB limit`);
    }
};

export async function uploadVideos(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
        throwIfTooLarge(file, 'File');
        formData.append('videos', file);
    });
    const response = await api.post(API_ENDPOINTS.MOCKUP.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function clearVideos() {
    const response = await api.post(API_ENDPOINTS.MOCKUP.CLEAR_VIDEOS);
    return response.data;
}

export async function uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await api.post(API_ENDPOINTS.MOCKUP.UPLOAD_IMAGES, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function clearImages() {
    const response = await api.post(API_ENDPOINTS.MOCKUP.CLEAR_IMAGES);
    return response.data;
}

export async function uploadBaseVideo(file: File) {
    throwIfTooLarge(file, 'Base video');
    const formData = new FormData();
    formData.append('base_video', file);
    const response = await api.post(API_ENDPOINTS.MOCKUP.UPLOAD_BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function processVideo(payload: ProcessPayload) {
    const response = await api.post(API_ENDPOINTS.MOCKUP.PROCESS, payload);
    return response.data;
}

export async function downloadVideo(): Promise<void> {
    const response = await api.get(API_ENDPOINTS.MOCKUP.DOWNLOAD, {
        responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'video/mp4' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final.mp4';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

export async function fetchProcessedVideoBlob(): Promise<Blob> {
    const response = await api.get(API_ENDPOINTS.MOCKUP.DOWNLOAD, {
        responseType: 'blob',
    });
    return new Blob([response.data], { type: 'video/mp4' });
}

export async function setPlatform(platform: string) {
    const response = await api.post(API_ENDPOINTS.MOCKUP.SET_PLATFORM, { platform });
    return response.data;
}

export async function getPlatform() {
    const response = await api.get(API_ENDPOINTS.MOCKUP.GET_PLATFORM);
    return response.data as { platform: string };
}

export async function listFrames(platform: string) {
    const response = await api.get(`${API_ENDPOINTS.MOCKUP.LIST_FRAMES}?platform=${platform}`);
    return response.data as { frames: string[]; platform: string };
}

export function getFrameUrl(filename: string, platform: string) {
    // Use backend API endpoint to serve frames
    return `${API_BASE_URL}${API_ENDPOINTS.MOCKUP.FRAME_URL.replace(':filename', filename)}?platform=${platform}`;
}

export async function listOverlays() {
    const response = await api.get(API_ENDPOINTS.MOCKUP.LIST_OVERLAYS);
    return response.data as { overlays: string[]; platform: string };
}

export function getOverlayUrl(filename: string, platform: string) {
    // Use backend API endpoint to serve overlays
    return `${API_BASE_URL}${API_ENDPOINTS.MOCKUP.OVERLAY_URL.replace(':filename', filename)}?platform=${platform}`;
}

export async function setOverlay(overlay: string | null) {
    const response = await api.post(API_ENDPOINTS.MOCKUP.SET_OVERLAY, { overlay });
    return response.data;
}

export async function getOverlay() {
    const response = await api.get(API_ENDPOINTS.MOCKUP.GET_OVERLAY);
    return response.data as { overlay: string | null };
}

export async function listUserImages() {
    const response = await api.get(API_ENDPOINTS.MOCKUP.LIST_USER_IMAGES);
    return response.data as { images: { name: string }[] };
}
