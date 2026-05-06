import { db } from '../services/firebase';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const useProgressUpdater = () => {
  const refreshSubjectProgress = async (subjectId) => {
    if (!subjectId) return;

    try {
      // 1. Single request to get ALL subtopics for this subject using the 'path' logic
      // Note: This assumes your subtopics are under subjects/{id}/topics/{id}/subtopics
      const subtopicsRef = collection(db, "subjects", subjectId, "topics");
      const topicsSnap = await getDocs(subtopicsRef);
      
      let totalSubtopics = 0;
      let doneReading = 0;
      let r1 = 0, r2 = 0, r3 = 0, r4 = 0;

      // 2. Fetch all subtopic collections in parallel
      const subtopicPromises = topicsSnap.docs.map(topicDoc => 
        getDocs(collection(db, "subjects", subjectId, "topics", topicDoc.id, "subtopics"))
      );
      
      const allSubtopicSnaps = await Promise.all(subtopicPromises);

      allSubtopicSnaps.forEach(snap => {
        snap.docs.forEach(subDoc => {
          const data = subDoc.data();
          totalSubtopics++;
          if (data.reading_done) doneReading++;
          if (data.revisions?.r1) r1++;
          if (data.revisions?.r2) r2++;
          if (data.revisions?.r3) r3++;
          if (data.revisions?.r4) r4++;
        });
      });

      if (totalSubtopics === 0) return;

      const calc = (count) => parseFloat(((count / totalSubtopics) * 100).toFixed(2));

      // 3. One single write to update all 5 bars at once
      await updateDoc(doc(db, "subjects", subjectId), {
        overall_progress: calc(doneReading),
        r1_progress: calc(r1),
        r2_progress: calc(r2),
        r3_progress: calc(r3),
        r4_progress: calc(r4),
      });

    } catch (err) {
      console.error("Speed optimization error:", err);
    }
  };

  return { refreshSubjectProgress };
};