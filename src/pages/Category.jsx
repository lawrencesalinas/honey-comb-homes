import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

//---------------------------------------------Category page for rent properties  or for sale properties------------------------------------------------------//

function Category() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const params = useParams()


    //----fetch rent listings or for sale listings beased  on url parameters.---//
    useEffect(() => {
        const fetchListings = async () => {
            try {
                // get reference to the collection
                const listingsRef = collection(db, 'listings')

                // create query
                // takes in reference to the listing, where the type from the params
                // orderBy the timestamp descending, limit of 10 per page
                const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), limit(8)
                )
                // Execute query
                // getDocs from the query created
                const querySnap = await getDocs(q)

                // last visible document
                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchedListing(lastVisible)


                const listings = []
                querySnap.forEach((doc) => {
                    // console.log('doc', doc.data());
                    // push the data to listings
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })
                setListings(listings)
                setLoading(false)
            } catch (error) {
                toast.error('Could not fetch listings')
            }
        }
        fetchListings()
    }, [params.categoryName])
    //-----------------------------------------------------------------------------//

    //------------------------Pagination/ Load More ----------------//
    const onMoreFetchListings = async () => {
        try {
            // get reference to the collection
            const listingsRef = collection(db, 'listings')

            // create query
            // takes in reference to the listing, where the type from the params
            // orderBy the timestamp descending, limit of 10 per page
            const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), startAfter(lastFetchedListing), limit(10)
            )
            // Execute query
            // getDocs from the query created
            const querySnap = await getDocs(q)

            // last visible document
            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchedListing(lastVisible)

            const listings = []
            querySnap.forEach((doc) => {
                console.log('doc', doc.data());
                // push the data to listings
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            // setListings to add new listing to the previos ones
            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)
        } catch (error) {
            toast.error('Could not fetch listings')
        }
    }



    return (

        <div className='category'>
            <header>
                <p className="pageHeader">
                    {/* if url is rent, show rent and if sell show sell */}
                    {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
                </p>
            </header>
            {/* if data is loading show spinner, if there is listings and greater than 0 or else show no listings? */}
            {loading ? <Spinner /> : listings && listings.length > 0 ?
                <>
                    {/* show listings here */}
                    <main>
                        <ul className="categoryListings">
                            {listings.map((listing) => (
                                <ListingItem listing={listing.data} id={listing.id} key={listing.id} />
                            ))}
                        </ul>
                    </main>

                    <br />
                    <br />

                    {/* ------show more listings to the page---- */}
                    {lastFetchedListing && (
                        <p className="loadMore" onClick={onMoreFetchListings}>Load More</p>
                    )}
                    {/* ---------------------------------------- */}

                </> : <p>No listings for {params.categoryName}</p>}
        </div>
    )
}

export default Category