import {
  handleMemoriesDelete,
  handleMemoriesGet,
  handleMemoriesPatch,
} from '@/features/memory/server/memories-route';

export async function GET(request: Request) {
  return handleMemoriesGet(request);
}

export async function DELETE(request: Request) {
  return handleMemoriesDelete(request);
}

export async function PATCH(request: Request) {
  return handleMemoriesPatch(request);
}
