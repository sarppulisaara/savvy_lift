export const workoutTemplates = {
  A: {
    title: "Treeni A",
    exercises: [
      {
        id: "bulgarian",
        name: "Smith Bulgarian Split Squat",
        muscleGroup: "Jalat",
        targetSets: 3,
        targetReps: "6-8",
        increment: 2.5,
        alternatives: [
          "Bulgarian Split Squat käsipainoilla",
          "Jalkaprässi – vaakaprässi",
          "Jalkaprässi (pystysuora / 45°)"
        ]
      },
      {
        id: "chest",
        name: "Penkkipunnerrus käsipainoilla",
        muscleGroup: "Rinta",
        targetSets: 3,
        targetReps: "6-8",
        increment: 2,
        alternatives: [
          "Chest Press (laite)",
          "Vinopenkki laitteessa",
          "Pec Deck"
        ]
      },
      {
        id: "row",
        name: "Low Row (kaapeli)",
        muscleGroup: "Selkä",
        targetSets: 3,
        targetReps: "6-8",
        increment: 2.5,
        alternatives: [
          "Vertical Row",
          "Lat Pulldown",
          "Yhden käden soutu käsipainoilla"
        ]
      },
      {
        id: "hamstring",
        name: "Reiden koukistus",
        muscleGroup: "Takareidet",
        targetSets: 3,
        targetReps: "10-12",
        increment: 2.5,
        alternatives: [
          "SJMV",
          "Glute Drive"
        ]
      },
      {
        id: "shoulder_side",
        name: "Vipunostot sivulle",
        muscleGroup: "Olkapäät",
        targetSets: 3,
        targetReps: "12-15",
        increment: 0.5,
        alternatives: [
          "Arnold Press",
          "Pystysoutu leveällä",
          "Pystypunnerrus laitteessa"
        ]
      },
      {
        id: "core_a",
        name: "Vatsarutistus laitteessa",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: "15-20",
        increment: 2.5,
        alternatives: [
          "Lankku"
        ]
      }
    ]
  },

  B: {
    title: "Treeni B",
    exercises: [
      {
        id: "glute",
        name: "Glute Drive",
        muscleGroup: "Pakarat",
        targetSets: 3,
        targetReps: "6-8",
        increment: 5,
        alternatives: [
          "SJMV",
          "Lantionnosto käsipainoilla"
        ]
      },
      {
        id: "legpress",
        name: "Jalkaprässi (pystysuora / 45°)",
        muscleGroup: "Jalat",
        targetSets: 3,
        targetReps: "8-10",
        increment: 5,
        alternatives: [
          "Jalkaprässi – vaakaprässi",
          "Smith Bulgarian Split Squat",
          "Askelkyykky käsipainoilla"
        ]
      },
      {
        id: "lat",
        name: "Lat Pulldown",
        muscleGroup: "Selkä",
        targetSets: 3,
        targetReps: "6-8",
        increment: 2.5,
        alternatives: [
          "Vertical Row",
          "Low Row (kaapeli)",
          "Yhden käden soutu käsipainoilla"
        ]
      },
      {
        id: "shoulder_press",
        name: "Pystypunnerrus laitteessa",
        muscleGroup: "Olkapäät",
        targetSets: 3,
        targetReps: "8-10",
        increment: 1,
        alternatives: [
          "Arnold Press",
          "Pystypunnerrus käsipainoilla"
        ]
      },
      {
        id: "curl",
        name: "Hammer Curl",
        muscleGroup: "Hauis",
        targetSets: 2,
        targetReps: "10-12",
        increment: 1,
      },
      {
        id: "core_b",
        name: "Vatsarutistus laitteessa",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: "15-20",
        increment: 2.5,
        alternatives: [
          "Lankku",
          "Jalkojen nosto roikkuen",
          "Vatsarutistus jumppapallolla",
          "Jalkojen nostot selinmakuulla",
          "Russian twist",
          "Istumaannousu lisäpainon kanssa"
        ]
      }
    ]
  }
};