import * as XLSX from 'xlsx';

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  basePrice: number;
  status: 'unsold' | 'sold';
  image?: string;
}

const gradeBasePrices: Record<string, number> = {
  A: 2000000,
  B: 1500000,
  C: 1000000,
};

export async function loadPlayersFromExcel(): Promise<PlayerData[]> {
  try {
    const response = await fetch('/players.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as any[];

    const players: PlayerData[] = data.map((row, index) => {
      const name = row.name || row.Name || '';
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const grade = (row.grade || row.Grade || 'C').toString().toUpperCase();
      const photo = row.photo || row.Photo || '';

      return {
        id: (index + 1).toString(),
        firstName,
        lastName,
        grade,
        basePrice: gradeBasePrices[grade] || 1000000,
        status: 'unsold' as const,
        image: photo ? `/player_images/${photo}` : undefined,
      };
    });

    return players;
  } catch (error) {
    console.error('Error loading players from Excel:', error);
    return [];
  }
}
