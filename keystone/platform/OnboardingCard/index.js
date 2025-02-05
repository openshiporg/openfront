import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Check } from "lucide-react";
import { Button } from "@ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@ui/card";

const SEED_STOREFRONT = gql`
  mutation {
    seedStorefront
  }
`;

/**
 * OnboardingCard displays initial setup instructions for a new store.
 * @param {Object} props
 * @param {Object} props.data - Query data containing regionsCount
 * The regionsCount is used as an indicator of store setup status.
 * A count of 0 indicates a fresh installation that needs initialization
 * with basic store data like regions, currencies, and other configurations.
 */
export const OnboardingCard = ({ data }) => {
  const [seedStore, { loading: isSeeding }] = useMutation(SEED_STOREFRONT, {
    refetchQueries: "active",
  });

  const handleSeed = async () => {
    try {
      await seedStore();
    } catch (error) {
      console.error("Error seeding store:", error);
    }
  };

  // Don't show the card if regions exist (store is already set up)
  if (parseInt(data["Region"]) > 0) {
    return null;
  }

  return (
    <Card className="flex mb-4 justify-between p-4 gap-8 bg-muted/40">
      <CardHeader className="p-0">
        <CardTitle className="text-sm font-semibold tracking-wide text-foreground/75 uppercase mb-2">
          Welcome to Openfront
        </CardTitle>
        <CardDescription>
          Let's set up your store with essential configurations. We'll create
          regions, countries, currencies, shipping options, payment providers,
          and add sample products to help you get started quickly.
        </CardDescription>
      </CardHeader>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          disabled={isSeeding}
          isLoading={isSeeding}
        >
          {!isSeeding && <Check />}
          {isSeeding ? "Creating..." : "Confirm"}
        </Button>
      </div>
    </Card>
  );
};
