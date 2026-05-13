export interface User {
  user_id: string;
  name: string;
  email: string;
}

export interface Seat {
  seat_id: number;
  pf_id: number;
  row_num: number;
  col_num: number;
  is_available: boolean;
}

export interface Performance {
  pf_id: number;
  title: string;
  start_at: string;
  price: number;
  seats: Seat[];
  available_count: number;
  total_count: number;
}

export interface Booking {
  booking_id: number;
  status: 'confirmed' | 'cancelled';
  booked_at: string;
  seat: { seat_id: number; row_num: number; col_num: number } | null;
  performance: { pf_id: number; title: string; start_at: string; price: number } | null;
}

export interface SelectedSeat {
  id: number;
  label: string;
}

export interface ModalState {
  icon: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}
