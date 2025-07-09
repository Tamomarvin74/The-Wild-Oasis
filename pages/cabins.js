 import CabinList from "@/components/CabinList";
import { getCabins } from "@/lib/data-service";
import Image from "next/image"; // Ensure Image is imported if used in CabinList or for other purposes

// Statically generated (SSG)
export async function getStaticProps() {
  const cabins = await getCabins();
  return { props: { cabins }, revalidate: 3600 };
}

function Cabins({ cabins }) {
  return (
    // Added bg-primary-900 for the entire page background, plus some padding and rounded corners
    <div className="bg-primary-900 p-8 rounded-lg">
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little
        home away from home. The perfect spot for a peaceful, calm vacation.
        Welcome to paradise.
      </p>

      {cabins && cabins.map(cabin => (
        <div key={cabin.id} className="mb-4 p-4 border border-primary-700 rounded-lg">
          <h3 className="text-xl font-semibold text-accent-400">{cabin.name}</h3>
          {/* Changed text-primary-200 to text-primary-100 for whiter text */}
          <p className="text-primary-100">Price: ${cabin.regular_price} (Discount: ${cabin.discount})</p>
          {cabin.image && (
            <Image
              src={cabin.image}
              alt={cabin.name}
              width={300}
              height={200}
              className="mt-2 rounded-md"
            />
          )}
          <p className="text-primary-300 mt-2">{cabin.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Cabins;
