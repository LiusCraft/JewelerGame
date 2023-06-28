export default interface Room {
  roomName: string | null,
  roomId: string | null,
  roomOwnerId: string|null,
  roomOwnerName?: string|null
};