type NavigationInstructionsProps = {
  currentLabel: string;
  currentStepDescription: string;
  destinationLabel: string;
  nextLabel: string;
  remainingDistanceMeters: number;
  startLabel: string;
};

export function NavigationInstructions({
  currentLabel,
  currentStepDescription,
  destinationLabel,
  nextLabel,
  remainingDistanceMeters,
  startLabel,
}: NavigationInstructionsProps) {
  return (
    <section aria-labelledby="live-navigation-heading">
      <p>Live Navigation</p>
      <h1 id="live-navigation-heading">Live Navigation zu {destinationLabel}</h1>
      <p>Startpunkt: {startLabel}</p>
      <p>Aktueller Orientierungspunkt: {currentLabel}</p>
      <p>Nächster Schritt: {currentStepDescription}</p>
      <p>Nächstes Ziel: {nextLabel}</p>
      <p>Verbleibende Distanz: ca. {remainingDistanceMeters} Meter</p>
    </section>
  );
}
