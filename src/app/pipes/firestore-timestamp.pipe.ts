// src/app/pipes/firestore-timestamp.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'firestoreTimestamp',
  standalone: true
})
export class FirestoreTimestampPipe implements PipeTransform {
  transform(timestamp: Timestamp | null): Date | null {
    return timestamp ? timestamp.toDate() : null;
  }
}