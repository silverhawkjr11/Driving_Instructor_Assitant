import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'timestampToDate'
})
export class TimestampToDatePipe implements PipeTransform {

  transform(value: Timestamp | null | undefined): Date | null {
    return value instanceof Timestamp ? value.toDate() : value || null;
  }
}
