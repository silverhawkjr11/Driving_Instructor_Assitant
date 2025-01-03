import { FirestoreTimestampPipe } from './firestore-timestamp.pipe';

describe('FirestoreTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new FirestoreTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
